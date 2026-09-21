<script lang="ts">
  import { compareRows } from "../data/content";
  import { reveal } from "./reveal";
</script>

<section id="compare" class="section section-alt">
  <div class="wrap">
    <p class="kicker">Compare</p>
    <h2 class="section-title">和官方版本的区别</h2>
    <div class="overflow-x-auto">
      <table class="compare-table">
        <thead>
          <tr>
            <th scope="col">对比项</th>
            <th scope="col" class="is-audit">ZCode Open Audit（本仓库）</th>
            <th scope="col">官方客户端（闭源）</th>
            <th scope="col">官方开源版</th>
          </tr>
        </thead>
        <tbody>
          {#each compareRows as row}
            <tr use:reveal>
              <th scope="row">{row.item}</th>
              <td class="is-audit">{row.audit}</td>
              <td>{row.officialClient}</td>
              <td>{row.officialOss}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
